package vihuela;

import java.io.PrintWriter;
import java.io.StringWriter;

public class Utilities {

    public static String getStackTrace(Exception ex) {
        StringWriter buffer = new StringWriter();
        PrintWriter writer = new PrintWriter(buffer);
        ex.printStackTrace(writer);
        writer.close();
        
        return buffer.toString();
    }
    
}
