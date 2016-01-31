package vihuela.web;

import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import vihuela.SimpleException;
import vihuela.data.Chapter;

import com.fasterxml.jackson.databind.ObjectMapper;


public class ChaptersServlet extends HttpServlet {

  private static final long serialVersionUID = 1L;
  private static final Logger logger = LogManager.getLogger(ChaptersServlet.class.getName());
  
  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException {
    Connection conn = null;
    PreparedStatement stmt = null;
    ResultSet rs = null;

    ObjectMapper mapper = new ObjectMapper();
    resp.setContentType("application/json; charset=UTF-8");
    try {
      PrintWriter out = resp.getWriter();
      conn = DriverManager.getConnection(DbcpManagerListener.getPoolableUri());
      String bookIdParam = req.getParameter("bookId");
      if (bookIdParam != null) {
        int bookId;  
        try { bookId = Integer.parseInt(bookIdParam); } catch (Exception ex) {
          throw new SimpleException("The value of \"bookId\" must be an integer");
        }
        stmt = conn.prepareStatement("SELECT chapter_id, title FROM chapters WHERE book_id = ?");
        stmt.setInt(1, bookId);
      }
      else {
        throw new SimpleException("Required parameter is missing: \"bookId\"");
      }

      rs =  stmt.executeQuery();
      ArrayList<Chapter> list = new ArrayList<Chapter>();
      while (rs.next()) {
        Chapter chapter = new Chapter();
        chapter.setChapterId(rs.getInt(1));
        chapter.setTitle(rs.getString(2));
        list.add(chapter);
      }
      
      mapper.writeValue(out, list);
    }
    catch (SQLException ex) {
      logger.error("Database error: " + ex.getMessage());
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
