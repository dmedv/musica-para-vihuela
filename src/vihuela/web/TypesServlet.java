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
import vihuela.data.Type;

import com.fasterxml.jackson.databind.ObjectMapper;


public class TypesServlet extends HttpServlet {

  private static final long serialVersionUID = 1L;
  private static final Logger logger = LogManager.getLogger(TypesServlet.class.getName());
  
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
      String queryParam = req.getParameter("query");
      if (queryParam != null) {
        if (bookIdParam != null) {
          int bookId;  
          try { bookId = Integer.parseInt(bookIdParam); } catch (Exception ex) {
            throw new SimpleException("The value of \"bookId\" must be an integer");
          }
          stmt = conn.prepareStatement("SELECT global_type_id AS type_id, types.title FROM types "+
              "INNER JOIN items ON types.type_id = items.type_id AND types.book_id = items.book_id WHERE items.title LIKE ? AND items.book_id = ? GROUP BY global_type_id ORDER BY global_type_id");
          stmt.setString(1, queryParam);
          stmt.setInt(2, bookId);
        }
        else {
          stmt = conn.prepareStatement("SELECT global_type_id AS type_id, types.title FROM types "+
              "INNER JOIN items ON types.type_id = items.type_id AND types.book_id = items.book_id WHERE items.title LIKE ? GROUP BY global_type_id ORDER BY global_type_id");
          stmt.setString(1, queryParam);
        }
      }
      else if (bookIdParam != null) {
        int bookId;  
        try { bookId = Integer.parseInt(bookIdParam); } catch (Exception ex) {
          throw new SimpleException("The value of \"bookId\" must be an integer");
        }
        stmt = conn.prepareStatement("SELECT DISTINCT type_id, title FROM types WHERE book_id = ? ORDER BY type_id");
        stmt.setInt(1, bookId);
      }

      rs =  stmt.executeQuery();
      ArrayList<Type> list = new ArrayList<Type>();
      while (rs.next()) {
        Type type = new Type();
        type.setTypeId(rs.getInt(1));
        type.setTitle(rs.getString(2));
        list.add(type);
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
