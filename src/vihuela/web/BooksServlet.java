package vihuela.web;

import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.fasterxml.jackson.databind.ObjectMapper;

import vihuela.data.Book;


public class BooksServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;
	private static final Logger logger = LogManager.getLogger(BooksServlet.class.getName());
	
	@Override
	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException {
		Connection conn = null;
		Statement stmt = null;
		ResultSet rs = null;
		
		ObjectMapper mapper = new ObjectMapper();
		resp.setContentType("application/json; charset=UTF-8");
		try {
			PrintWriter out = resp.getWriter();
			conn = DriverManager.getConnection(DbcpManagerListener.getPoolableUri());
			
			stmt = conn.createStatement();
			rs =  stmt.executeQuery("SELECT book_id, title FROM books");
			ArrayList<Book> list = new ArrayList<Book>();
			while (rs.next()) {
				Book book = new Book();
				book.setBookId(rs.getInt(1));
				book.setTitle(rs.getString(2));
				list.add(book);
			}
			
			mapper.writeValue(out, list);
		}
		catch (SQLException ex) {
			logger.error("Database error",ex);
			resp.setStatus(500);
		}
		catch (Exception ex) {
			logger.error("Unexpected error",ex);
			resp.setStatus(500);
		}
		finally {
			try { if (rs != null) rs.close(); } catch (Exception ex) { }
			try { if (stmt != null) stmt.close(); } catch (Exception ex) { }
			try { if (conn != null) conn.close(); } catch (Exception ex) { }
		}
	}
}
