package vihuela.web;

import java.sql.Driver;
import java.sql.DriverManager;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import org.apache.commons.dbcp.ConnectionFactory;
import org.apache.commons.dbcp.DriverManagerConnectionFactory;
import org.apache.commons.dbcp.PoolableConnectionFactory;
import org.apache.commons.dbcp.PoolingDriver;
import org.apache.commons.pool.impl.GenericObjectPool;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class DbcpManagerListener implements ServletContextListener {
	
	public static final String DBCP_POOL_NAME 	= "vihuela";
	public static final String DBCP_URI_PREFIX 	= "jdbc:apache:commons:dbcp:";
	public static final String DB_DRIVER_CLASS 	= "Database.DriverClass";
	public static final String DB_URI			= "Database.Uri";
	
	private PoolingDriver poolingDriver;
	private Driver dbDriver;

	private static final Logger logger = LogManager.getLogger(DbcpManagerListener.class.getName());
	
	@Override
	public void contextDestroyed(ServletContextEvent event) {
		logger.info("Closing connection pool");
		
		try 
			{ poolingDriver.closePool(DBCP_POOL_NAME); }
		catch (Exception ex) 
			{ logger.error("Failed to close connection pool", ex); }
		
		
		logger.info("Unregistering JDBC drivers");
		
		try 
			{ DriverManager.deregisterDriver(poolingDriver); }
		catch (Exception ex) 
			{ logger.error("Failed to unregister JDBC driver", ex); }

		try 
			{ DriverManager.deregisterDriver(dbDriver); }
		catch (Exception ex) 
			{ logger.error("Failed to unregister JDBC driver", ex); }
	}

	@Override
	public void contextInitialized(ServletContextEvent event) {
		try {
			logger.info("Initializing connection pool");
			
			String dbDriverClass = event.getServletContext().getInitParameter(DB_DRIVER_CLASS);
			String dbUri = event.getServletContext().getInitParameter(DB_URI);
			
			Class.forName(dbDriverClass);
			dbDriver = DriverManager.getDriver(dbUri);
			
			GenericObjectPool connectionPool = new GenericObjectPool(null);
			connectionPool.setTestOnBorrow(true);
			
			ConnectionFactory connectionFactory = new DriverManagerConnectionFactory(dbUri,null);
			PoolableConnectionFactory poolableConnectionFactory = new PoolableConnectionFactory(connectionFactory,connectionPool,null,"SELECT 1",false,true);
			
			Class.forName("org.apache.commons.dbcp.PoolingDriver");
			poolingDriver = (PoolingDriver)DriverManager.getDriver(DBCP_URI_PREFIX);
			poolingDriver.registerPool(DBCP_POOL_NAME,connectionPool);
		}
		catch (Exception ex) {
			logger.error("Failed to initialize connection pool",ex);
		}
	}

	public static String getPoolableUri() {
		return DBCP_URI_PREFIX + DBCP_POOL_NAME;
	}
	
}
