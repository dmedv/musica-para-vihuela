package vihuela;

import java.util.Properties;

public class AppSettings {

    private String databaseConnectionString;
    private String databaseDriver;
    private int databasePoolSize;
    
    public AppSettings(Properties properties) {
        databaseConnectionString = properties.getProperty("database.connectionString");
        databaseDriver = properties.getProperty("database.driver");
        databasePoolSize = Integer.parseInt(properties.getProperty("database.poolSize"));
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
    
}
