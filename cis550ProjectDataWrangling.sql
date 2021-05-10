/* 
    All importing of data was done using SQLDeveloper, so we did not manually write out the DDL.
    Likewise, removing of null values was done in the importing stage bececause any rows in which 
    the primary keys were null in the datasets were automatically removed by SQLDeveloper. 
*/

/* Adding Date_Calendar column to CryptoQuote relation */
ALTER TABLE CryptoQuote ADD Calendar_Date DATE;
UPDATE CryptoQuote SET Calendar_Date = TO_DATE('1970/01/01', 'YYYY/MM/DD') + ( 1 / 24 / 60 / 60 ) * Timestamp;

/* Set default column value for Cryptocurrency relation */
UPDATE Cryptocurrency SET Name = 'BTC';



