package vihuela;

import java.util.Properties;

public class AppSettings {

    private String databaseConnectionString;
    private String databaseDriver;
    private int databasePoolSize;
    private String imagesRoot;
    
    public AppSettings(Properties properties) {
        databaseConnectionString = properties.getProperty("database.connectionString");
        databaseDriver = properties.getProperty("database.driver");
        databasePoolSize = Integer.parseInt(properties.getProperty("database.poolSize"));
        imagesRoot = properties.getProperty("images.root");
    }
    
    public String getDatabaseConnectionString() {
        return databaseConnectionString;
    }

    public int getDatabasePoolSize() {
        return databasePoolSize;
    }

    public String getDatabaseDriver() {
        return databaseDriver;
    }

    public String getImagesRoot() {
        return imagesRoot;
    }

}
