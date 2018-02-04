package vihuela.controllers;

import java.io.FileInputStream;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.dbutils.DbUtils;
import org.apache.commons.io.IOUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.graphics.image.JPEGFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.node.JsonNodeFactory;

import vihuela.AppConfig;
import vihuela.model.Author;
import vihuela.model.Book;
import vihuela.model.Chapter;
import vihuela.model.ErrorContent;
import vihuela.model.Item;
import vihuela.model.Page;
import vihuela.model.Type;

@RestController
@CrossOrigin
@RequestMapping("/api/*")
public class ApiController {

    private static final Logger logger = LogManager.getLogger(ApiController.class);

    @Autowired
    ServletContext context;
    
    @Autowired
    AppConfig appConfig;

    @RequestMapping(value = "books", method = RequestMethod.GET)
    public Iterable<Book> getBooks() throws Exception {
        Connection connection = null;
        Statement statement = null;
        ResultSet resultSet = null;
        try {
            connection = appConfig.getDataSource().getConnection();
            statement = connection.createStatement();
            resultSet = statement.executeQuery("SELECT book_id, title FROM books");
            ArrayList<Book> bookList = new ArrayList<Book>();
            while (resultSet.next()) {
                Book book = new Book();
                book.setBookId(resultSet.getInt(1));
                book.setTitle(resultSet.getString(2));
                bookList.add(book);
            }
            return bookList;
        }
        finally {
            DbUtils.closeQuietly(resultSet);
            DbUtils.closeQuietly(statement);
            DbUtils.closeQuietly(connection);
        }
    }

    @RequestMapping(value = "authors", method = RequestMethod.GET)
    public Iterable<Author> getAuthors() throws Exception {
        Connection connection = null;
        Statement statement = null;
        ResultSet resultSet = null;
        try {
            connection = appConfig.getDataSource().getConnection();
            statement = connection.createStatement();
            resultSet = statement.executeQuery("SELECT author_id, name FROM authors");
            ArrayList<Author> authorList = new ArrayList<Author>();
            while (resultSet.next()) {
                Author author = new Author();
                author.setAuthorId(resultSet.getInt(1));
                author.setName(resultSet.getString(2));
                authorList.add(author);
            }
            return authorList;
        }
        finally {
            DbUtils.closeQuietly(resultSet);
            DbUtils.closeQuietly(statement);
            DbUtils.closeQuietly(connection);
        }
    }
    
    @RequestMapping(value = "books/{bookId}/chapters", method = RequestMethod.GET)
    public Iterable<Chapter> getChapters(@PathVariable int bookId) throws Exception {
        Connection connection = null;
        PreparedStatement statement = null;
        ResultSet resultSet = null;
        try {
            connection = appConfig.getDataSource().getConnection();
            statement = connection.prepareStatement("SELECT chapter_id, title FROM chapters WHERE book_id = ?");
            statement.setInt(1, bookId);
            resultSet = statement.executeQuery();
            ArrayList<Chapter> chapterList = new ArrayList<Chapter>();
            while (resultSet.next()) {
                Chapter chapter = new Chapter();
                chapter.setChapterId(resultSet.getInt(1));
                chapter.setTitle(resultSet.getString(2));
                chapterList.add(chapter);
            }
            return chapterList;
        }
        finally {
            DbUtils.closeQuietly(resultSet);
            DbUtils.closeQuietly(statement);
            DbUtils.closeQuietly(connection);
        }
    }
    
    @RequestMapping(value = "books/{maybeBookId}/items", method = RequestMethod.GET)
    public Iterable<Item> getItems(
            @PathVariable String maybeBookId, 
            @RequestParam(name="query", required=false) String query) throws Exception {
        
        Connection connection = null;
        PreparedStatement statement = null;
        ResultSet resultSet = null;
        try {
            connection = appConfig.getDataSource().getConnection();
            if (query != null) {
                if ("*".equals(maybeBookId)) {
                    statement = connection.prepareStatement(
                            "SELECT items.book_id, item_id, author_id, items.title, notes, global_type_id AS type_id,chapter_id FROM items " +
                            "JOIN types ON types.type_id = items.type_id AND types.book_id = items.book_id WHERE items.title LIKE ? ORDER BY book_id,item_id");
                    statement.setString(1, query);
                }
                else {
                    int bookId = Integer.parseInt(maybeBookId);
                    statement = connection.prepareStatement(
                            "SELECT items.book_id, item_id, author_id, items.title, notes, global_type_id AS type_id,chapter_id FROM items " +
                            "JOIN types ON types.type_id = items.type_id AND types.book_id = items.book_id WHERE items.title LIKE ? AND items.book_id=? ORDER BY book_id,item_id");
                    statement.setString(1, query);
                    statement.setInt(2, bookId);
                }
            }
            else {
                int bookId = Integer.parseInt(maybeBookId);
                statement = connection.prepareStatement(
                        "SELECT book_id, item_id, author_id, title, notes, type_id, chapter_id FROM items WHERE book_id=? ORDER BY item_id");
                statement.setInt(1, bookId);
            }

            resultSet = statement.executeQuery();
            ArrayList<Item> itemList = new ArrayList<Item>();
            while (resultSet.next()) {
                Item item = new Item();
                item.setBookId(resultSet.getInt(1));
                item.setItemId(resultSet.getInt(2));
                item.setAuthorId(resultSet.getInt(3));
                item.setTitle(resultSet.getString(4));
                item.setNotes(resultSet.getString(5));
                item.setTypeId(resultSet.getInt(6));
                item.setChapterId(resultSet.getInt(7));
                itemList.add(item);
            }
            return itemList;
        }
        finally {
            DbUtils.closeQuietly(resultSet);
            DbUtils.closeQuietly(statement);
            DbUtils.closeQuietly(connection);
        }
    }
    
    @RequestMapping(value = "books/{maybeBookId}/types", method = RequestMethod.GET)
    public Iterable<Type> getTypes(
            @PathVariable String maybeBookId, 
            @RequestParam(name="query", required=false) String query) throws Exception {
        
        Connection connection = null;
        PreparedStatement statement = null;
        ResultSet resultSet = null;
        try {
            connection = appConfig.getDataSource().getConnection();
            if (query != null) {
                if ("*".equals(maybeBookId)) {
                    statement = connection.prepareStatement(
                            "SELECT global_type_id AS type_id, types.title FROM types " +
                            "JOIN items ON types.type_id = items.type_id AND types.book_id = items.book_id WHERE items.title LIKE ? GROUP BY global_type_id ORDER BY global_type_id");
                    statement.setString(1, query);
                }
                else {
                    int bookId = Integer.parseInt(maybeBookId);
                    statement = connection.prepareStatement(
                            "SELECT global_type_id AS type_id, types.title FROM types " +
                            "JOIN items ON types.type_id = items.type_id AND types.book_id = items.book_id WHERE items.title LIKE ? AND items.book_id = ? GROUP BY global_type_id ORDER BY global_type_id");
                    statement.setString(1, query);
                    statement.setInt(2, bookId);
                }
            }
            else {
                int bookId = Integer.parseInt(maybeBookId);
                statement = connection.prepareStatement("SELECT DISTINCT type_id, title FROM types WHERE book_id = ? ORDER BY type_id");
                statement.setInt(1, bookId);
            }

            resultSet = statement.executeQuery();
            ArrayList<Type> typeList = new ArrayList<Type>();
            while (resultSet.next()) {
                Type type = new Type();
                type.setTypeId(resultSet.getInt(1));
                type.setTitle(resultSet.getString(2));
                typeList.add(type);
            }
            return typeList;
        }
        finally {
            DbUtils.closeQuietly(resultSet);
            DbUtils.closeQuietly(statement);
            DbUtils.closeQuietly(connection);
        }
    }
    
    @RequestMapping(value = "books/{bookId}/items/{itemId}/{output}", method = RequestMethod.GET)
    public Object getPages(
            @PathVariable int bookId, 
            @PathVariable int itemId, 
            @PathVariable String output, 
            HttpServletResponse response) throws Exception {
        
        String imagesRoot = appConfig.getAppSettings().getImagesRoot();
        Connection connection = null;
        PreparedStatement statement = null;
        ResultSet resultSet = null;
        try {
            connection = appConfig.getDataSource().getConnection();
            statement = connection.prepareStatement("SELECT page_id, filename FROM pages WHERE book_id=? AND item_id=? ORDER BY page_id");
            statement.setInt(1, bookId);
            statement.setInt(2, itemId);
            
            resultSet = statement.executeQuery();
            ArrayList<Page> pageList = new ArrayList<Page>();
            while (resultSet.next()) {
              Page image = new Page();
              image.setPageId(resultSet.getInt(1));
              image.setFilename("book_" + bookId + "/" + resultSet.getString(2).toLowerCase());
              pageList.add(image);
            }
            resultSet.close();
            statement.close();
            
            switch (output) {
                case "json":
                    return pageList;
                case "zip":
                    response.setContentType("application/zip");
                    response.setHeader("Content-Disposition","attachment;filename=\"images.zip\""); 
                    ZipOutputStream zip = new ZipOutputStream(response.getOutputStream());
                    for (Page bookPage: pageList) {
                      String filename = Paths.get(imagesRoot, "pages", bookPage.getFilename()).toString();
                      FileInputStream input = new FileInputStream(filename);
                      zip.putNextEntry(new ZipEntry(bookPage.getFilename().split("/")[1]));
                      IOUtils.copy(input, zip);
                      input.close();
                      zip.closeEntry();
                    }
                    zip.close();
                    break;
                case "pdf":
                    response.setContentType("application/pdf");
                    PDDocument document = new PDDocument();
                    for (Page bookPage: pageList) {
                      String filename = Paths.get(imagesRoot, "pages", bookPage.getFilename()).toString();
                      FileInputStream input = new FileInputStream(filename);
                      PDImageXObject image = JPEGFactory.createFromStream(document, input);
                      PDPage documentPage = new PDPage(new PDRectangle(image.getWidth(), image.getHeight()));
                      document.addPage(documentPage);
                      PDPageContentStream contentStream = new PDPageContentStream(document, documentPage);
                      contentStream.drawImage(image, 0, 0);
                      contentStream.close();
                    }
                    document.save(response.getOutputStream());
                    document.close();
                    break;
                default:
                    response.setStatus(HttpStatus.NOT_IMPLEMENTED.value());
                    break;
            }
            
            return null;
        }
        finally {
            DbUtils.closeQuietly(resultSet);
            DbUtils.closeQuietly(statement);
            DbUtils.closeQuietly(connection);
        }
    }
    
    @ExceptionHandler(Exception.class)
    @ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR)
    @ResponseBody
    public Object handleException(Exception ex) {
        logger.error(ex);
        JsonNodeFactory factory = JsonNodeFactory.instance;
        return factory.objectNode().putPOJO("error", new ErrorContent(ex));
    }

}
