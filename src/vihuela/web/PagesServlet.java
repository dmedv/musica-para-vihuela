package vihuela.web;

import java.io.FileInputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.edit.PDPageContentStream;
import org.apache.pdfbox.pdmodel.graphics.xobject.PDJpeg;

import vihuela.SimpleException;
import vihuela.data.Page;

import com.fasterxml.jackson.databind.ObjectMapper;

public class PagesServlet extends HttpServlet {

  private static final long serialVersionUID = 1L;
  private static final Logger logger = LogManager.getLogger(PagesServlet.class.getName());
  
  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException {
    Connection conn = null;
    PreparedStatement stmt = null;
    ResultSet rs = null;
    
    ObjectMapper mapper = new ObjectMapper();
    resp.setContentType("application/json; charset=UTF-8");
    try {
      
      conn = DriverManager.getConnection(DbcpManagerListener.getPoolableUri());
      
      String bookIdParam = req.getParameter("bookId");
      String refParam = req.getParameter("ref");
      String createPdf = req.getParameter("pdf");
      String createZip = req.getParameter("zip");
      if (bookIdParam == null || refParam == null) {
        throw new SimpleException("Required parameter is missing (\"bookId\" & \"ref\")");
      }
      
      int ref, bookId;
      try { bookId = Integer.parseInt(bookIdParam); } catch (Exception ex) {
        throw new SimpleException("The value of \"bookId\" must be an integer");
      }
      
      try { ref = Integer.parseInt(refParam); } catch (Exception ex) {
        throw new SimpleException("The value of \"ref\" must be an integer");
      }
      
      stmt = conn.prepareStatement("SELECT page_id,filename FROM pages WHERE book_id=? AND item_id=? ORDER BY page_id");
      stmt.setInt(1, bookId);
      stmt.setInt(2, ref);
      
      rs =  stmt.executeQuery();
      ArrayList<Page> list = new ArrayList<Page>();
      while (rs.next()) {
        Page image = new Page();
        image.setPageId(rs.getInt(1));
        image.setFilename("book_"+bookId+"/"+rs.getString(2).toLowerCase());        
        list.add(image);
      }
      rs.close();
      stmt.close();
      
      if (createPdf == null && createZip == null) {
        PrintWriter out = resp.getWriter();
        mapper.writeValue(out, list);
      }
      else if (createPdf != null && createZip == null) {
        resp.setContentType("application/pdf");
        OutputStream out = resp.getOutputStream();
        PDDocument document = new PDDocument();
        
        for (Page image: list) {
          String filename = getServletContext().getRealPath("/")+"/images/pages/"+image.getFilename();

          FileInputStream is = new FileInputStream(filename);

          PDJpeg img = new PDJpeg(document, is);
          
          PDPage page = new PDPage(new PDRectangle(img.getWidth(),img.getHeight()));
          document.addPage(page);
          
          PDPageContentStream stream = new PDPageContentStream(document, page);
          stream.drawImage(img, 0, 0);
          stream.close();
        }
        document.save(out);
      }
      else if (createZip != null && createPdf == null) {
        resp.setContentType("application/zip");
        resp.setHeader("Content-Disposition","attachment;filename=\"pages.zip\""); 
        OutputStream out = resp.getOutputStream();
        ZipOutputStream zip = new ZipOutputStream(out);
        for (Page image: list) {
          String filename = getServletContext().getRealPath("/")+"/images/pages/"+image.getFilename();
          FileInputStream is = new FileInputStream(filename);
          zip.putNextEntry(new ZipEntry(image.getFilename().split("/")[1]));
          IOUtils.copy(is, zip);
          is.close();
          zip.closeEntry();
        }
        zip.close();
      }
      else {
        throw new SimpleException("Ambiguous output settings: both pdf and zip requested");
      }
    }
    catch (SQLException ex) {
      logger.error("Database error: " + ex.getMessage());
      resp.setStatus(500);
    }
    catch (SimpleException ex) {
      logger.error(ex.getMessage());
      resp.setStatus(500);
    }
    catch (Exception ex) {
      logger.error("Unexpected error", ex);
      resp.setStatus(500);
    }
    finally {
      try { if (rs != null) rs.close(); } catch (Exception ex) { }
      try { if (stmt != null) stmt.close(); } catch (Exception ex) { }
      try { if (conn != null) conn.close(); } catch (Exception ex) { }
    }
  }
}
