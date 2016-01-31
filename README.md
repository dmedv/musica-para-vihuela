# musica-para-vihuela
Libros de música para vihuela, 1536-1576

A web-based remake of the old CD catalog by Gerardo Arriaga et al. It also includes music pages from the "Ramillete de flores" manuscript (1593). Old images have been replaced with new, higher resolution versions from Biblioteca Nacional de España, where appropriate.

## Deployment instructions
### Prerequisites
- Java JDK 1.7+
- Apache Ant
- Apache Tomcat
- MySQL / MariaDB

### Build the project

```
ant init-ivy
ant all
```

### Create the database

```
sql> CREATE DATABASE vihuela;
sql> USE vihuela
sql> SOURCE vihuela-db.sql
```

Update the JDBC connection string in `web/WEB-INF/web.xml`.

### Deploy the webapp

```
mkdir /var/lib/tomcat/webapps/vihuela
cp build/* /var/lib/tomcat/webapps/vihuela -R
```

Download `images.tar.gz` from Releases.

```
tar -zxf images.tar.gz
mv images /var/lib/tomcat/webapps/vihuela/images
```

Restart Tomcat:

```
systemctl restart tomcat
```

### Test

[http://localhost:8080/vihuela](http://localhost:8080/vihuela)
