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
import vihuela.data.Item;

import com.fasterxml.jackson.databind.ObjectMapper;

public class ItemsServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;
	private static final Logger logger = LogManager.getLogger(ItemsServlet.class.getName());
	
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
			
			stmt = null;
			
			String queryParam = req.getParameter("query");
			String bookIdParam = req.getParameter("bookId");
			
			if (queryParam != null) {
				if (bookIdParam != null) {
					int bookId;
					try { bookId = Integer.parseInt(bookIdParam); } catch (Exception ex) {
						throw new SimpleException("The value of \"bookId\" must be an integer");
					}
					stmt = conn.prepareStatement("SELECT items.book_id,item_id,author_id,items.title,notes,global_type_id AS type_id,chapter_id FROM items "+
							"JOIN types ON types.type_id = items.type_id AND types.book_id = items.book_id WHERE items.title LIKE ? AND items.book_id=? ORDER BY book_id,item_id");
					stmt.setString(1, queryParam);
					stmt.setInt(2, bookId);
				}
				else {
					stmt = conn.prepareStatement("SELECT items.book_id,item_id,author_id,items.title,notes,global_type_id AS type_id,chapter_id FROM items "+
							"JOIN types ON types.type_id = items.type_id AND types.book_id = items.book_id WHERE items.title LIKE ? ORDER BY book_id,item_id");
					stmt.setString(1, queryParam);
				}
			}
			else if (bookIdParam != null) {
				int bookId;  
				try { bookId = Integer.parseInt(bookIdParam); } catch (Exception ex) {
					throw new SimpleException("The value of \"bookId\" must be an integer");
				}
				stmt = conn.prepareStatement("SELECT book_id,item_id,author_id,title,notes,type_id,chapter_id FROM items WHERE book_id=? ORDER BY item_id");
				stmt.setInt(1, bookId);
			}
			else {
				throw new SimpleException("Required parameter is missing (\"bookId\" | \"query\")");
			}
 			
			rs =  stmt.executeQuery();
			ArrayList<Item> list = new ArrayList<Item>();
			while (rs.next()) {
				Item item = new Item();
				item.setBookId(rs.getInt(1));
				item.setItemId(rs.getInt(2));
				item.setAuthorId(rs.getInt(3));
				item.setTitle(rs.getString(4));
				item.setNotes(rs.getString(5));
				item.setTypeId(rs.getInt(6));
				item.setChapterId(rs.getInt(7));
				list.add(item);
			}
			rs.close();
			stmt.close();
			
			mapper.writeValue(out, list);
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
