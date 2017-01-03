package vihuela;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

@WebListener
public class AppLifecycleListener implements ServletContextListener {

    private static final Logger logger = LogManager.getLogger(AppLifecycleListener.class);
    private AppConfig appConfig = AppConfig.getInstance();

    @Override
    public void contextDestroyed(ServletContextEvent event) {
        logger.info("Context destroyed");
        appConfig.shutdown();
    }

    @Override
    public void contextInitialized(ServletContextEvent event) {
        logger.info("Context initialized");
        try {
            appConfig.loadSettings(event.getServletContext().getResourceAsStream("/WEB-INF/application.properties"));
            appConfig.startup();
        } catch (Exception ex) {
            logger.error(ex);
        }
    }

}
