package vihuela.model;

import java.util.Date;

import vihuela.Utilities;

public class ErrorContent {

    private String message;
    private String stackTrace;
    private Date time;

    public ErrorContent(Exception ex) {
        this.setTime(new Date());
        this.message = ex.getMessage();
        this.setStackTrace(Utilities.getStackTrace(ex));
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getStackTrace() {
        return stackTrace;
    }

    public void setStackTrace(String stackTrace) {
        this.stackTrace = stackTrace;
    }

    public Date getTime() {
        return time;
    }

    public void setTime(Date time) {
        this.time = time;
    }

}
