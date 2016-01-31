package vihuela;

public class SimpleException extends Exception {

	private static final long serialVersionUID = 1L;

	public SimpleException() {
	}

	public SimpleException(String message) {
		super(message);
	}

	public SimpleException(Throwable cause) {
		super(cause);
	}

	public SimpleException(String message, Throwable cause) {
		super(message, cause);
	}

	public SimpleException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
		super(message, cause, enableSuppression, writableStackTrace);
	}

}
