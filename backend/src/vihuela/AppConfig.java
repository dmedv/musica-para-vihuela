package vihuela;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import javax.sql.DataSource;

import com.zaxxer.hikari.HikariDataSource;

public class AppConfig {

    private static AppConfig instance = new AppConfig();
    private AppSettings appSettings;
    private HikariDataSource dataSource;

    public static AppConfig getInstance() {
        return instance;
    }

    private AppConfig() {
    }

    public void loadSettings(InputStream input) throws IOException {
        Properties properties = new Properties();
        properties.load(input);
        appSettings = new AppSettings(properties);
    }

    public void startup() throws ClassNotFoundException {
        Class.forName(appSettings.getDatabaseDriver());
        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(appSettings.getDatabaseConnectionString());
        ds.setMaximumPoolSize(appSettings.getDatabasePoolSize());
        dataSource = ds;
    }

    public void shutdown() {
        dataSource.close();
    }

    public AppSettings getAppSettings() {
        return appSettings;
    }

    public DataSource getDataSource() {
        return dataSource;
    }

}
