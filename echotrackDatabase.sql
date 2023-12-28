create database ecotrackDatabase;
use ecotrackDatabase;
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';
flush privileges;
CREATE TABLE user (
   userID int NOT NULL AUTO_INCREMENT,
   name varchar(45) NOT NULL,
   password varchar(100) NOT NULL,
   email varchar(100) NOT NULL,
   location varchar(45) NOT NULL,
   score double NOT NULL,
   PRIMARY KEY (userID)
 ) ;
 
CREATE TABLE sensors (
   sensorsID int NOT NULL AUTO_INCREMENT,
   sensorType varchar(45) NOT NULL,
   PRIMARY KEY (sensorsID)
 ) ;
 
 CREATE TABLE interests (
  InterestID int NOT NULL AUTO_INCREMENT,
  userID int NOT NULL,
  sensorID int NOT NULL,
  threshold double DEFAULT '0',
  PRIMARY KEY (InterestID),
  KEY userID_idx (userID),
  KEY sensorID_idx (sensorID),
  CONSTRAINT fk_interests_user FOREIGN KEY (userID) REFERENCES user (userID) ON DELETE CASCADE,
  CONSTRAINT sensorID FOREIGN KEY (sensorID) REFERENCES sensors (sensorsID),
  CONSTRAINT userID FOREIGN KEY (userID) REFERENCES user (userID)
);
 
 CREATE TABLE data_collection (
  dataCollectionID int NOT NULL AUTO_INCREMENT,
  interestID int NOT NULL,
  value double NOT NULL,
  date date NOT NULL,
  time time NOT NULL,
  PRIMARY KEY (dataCollectionID),
  KEY interestID_idx (interestID),
  CONSTRAINT fk_data_collection_interests FOREIGN KEY (interestID) REFERENCES interests (InterestID) ON DELETE CASCADE,
  CONSTRAINT interestID FOREIGN KEY (interestID) REFERENCES interests (InterestID)
);
 
 
  CREATE TABLE educational_resources (
   resourceID int NOT NULL AUTO_INCREMENT,
   type int NOT NULL,
   title MEDIUMTEXT NOT NULL,
   URL LONGTEXT NOT NULL,
   PRIMARY KEY (resourceID),
   KEY type_idx (type),
   CONSTRAINT type FOREIGN KEY (type) REFERENCES sensors (sensorsID)
 );

CREATE TABLE `ecotrackDatabase`.`chat` (
  `chatId` INT NOT NULL AUTO_INCREMENT,
  `senderID` INT NOT NULL,
  `reciver` INT NOT NULL,
  `msg` LONGTEXT NOT NULL,
  `Date` DATE NOT NULL,
  `time` TIME NOT NULL,
  PRIMARY KEY (`chatId`),
  INDEX `reciver_idx` (`reciver` ASC) VISIBLE,
  INDEX `senderID_idx` (`senderID` ASC) VISIBLE,
  CONSTRAINT `senderID`
    FOREIGN KEY (`senderID`)
    REFERENCES `ecotrackDatabase`.`user` (`userID`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `reciver`
    FOREIGN KEY (`reciver`)
    REFERENCES `ecotrackDatabase`.`user` (`userID`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);

 CREATE TABLE report (
  reportID int NOT NULL AUTO_INCREMENT,
  user_id int NOT NULL,
  userName varchar(100) NOT NULL,
  environmental_issue varchar(200) NOT NULL,
  description varchar(5000) DEFAULT NULL,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (reportID),
  KEY fk_reports_users (user_id),
  CONSTRAINT fk_reports_users FOREIGN KEY (user_id) REFERENCES user (userID) ON DELETE CASCADE,
  CONSTRAINT report_ibfk_1 FOREIGN KEY (user_id) REFERENCES user (userID)
);

 
 INSERT INTO sensors (sensorType) VALUES ("Humidity");
 INSERT INTO sensors (sensorType) VALUES ("Wind");
 INSERT INTO sensors (sensorType) VALUES ("Soil moisture");
 INSERT INTO sensors (sensorType) VALUES ("water quality");
INSERT INTO sensors (sensorType) VALUES ("Pressure");
INSERT INTO sensors (sensorType) VALUES ("Rainfall");
INSERT INTO sensors (sensorType) VALUES ("Temperature");
INSERT INTO sensors (sensorType) VALUES ("air quality");
 
 INSERT INTO educational_resources (type,title,URL) VALUES (8,"What is air pollution and how to protect your family from it","https://www.unicef.org/parenting/air-pollution?gclid=Cj0KCQiAmNeqBhD4ARIsADsYfTeNLvX8aNcs94VK8_FNXFsDMhvrEwyYL4UNQkssADqCy6woOv_EdYkaAjY7EALw_wcB");
 INSERT INTO educational_resources (type,title,URL) VALUES (8,"HOW AIR POLLUTION HARMS OUR HEALTH","https://unfoundation.org/blog/post/smoke-for-breakfast-air-pollution-harms-our-health-and-household-cooking-is-partly-to-blame/?gclid=Cj0KCQiAmNeqBhD4ARIsADsYfTfVFOQ_qLt1rOpl2cccEdNGwgdGckyENLw3rlcr-dI4KO8QPlfHaDoaAnYOEALw_wcB");
 INSERT INTO educational_resources (type,title,URL) VALUES (7,"Effects of global warming","https://www.nationalgeographic.com/environment/article/global-warming-effects");
 INSERT INTO educational_resources (type,title,URL) VALUES (4,"Effects of Water Pollution on Human Health and Disease Heterogeneity: A Review","https://www.frontiersin.org/articles/10.3389/fenvs.2022.880246/full");
 INSERT INTO educational_resources (type,title,URL) VALUES (1,"The environment humidity effect on the tribo-charge of powder","https://www.sciencedirect.com/science/article/abs/pii/S0032591003001578");
 INSERT INTO educational_resources (type,title,URL) VALUES (3,"Relationship between soil respiration and soil moisture","https://www.sciencedirect.com/science/article/abs/pii/003807178390010X");
 INSERT INTO educational_resources (type,title,URL) VALUES (5,"Water and health: From environmental pressures to integrated responses","https://www.sciencedirect.com/science/article/pii/S0001706X18300883");
 INSERT INTO educational_resources (type,title,URL) VALUES (6,"Heavy Rainfall Events and Diarrhea Incidence: The Role of Social and Environmental Factors","https://academic.oup.com/aje/article/179/3/344/104219");
 INSERT INTO educational_resources (type,title,URL) VALUES (2,"Criteria for environmental wind conditions","https://www.sciencedirect.com/science/article/abs/pii/0167610578900132");
 




    
 
 

