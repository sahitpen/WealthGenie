# WealthGenie

## Introduction
The lack of financial literacy is a significant problem in today’s generation. Investment basics are not taught in most schools, so a large portion of society does not know how to properly manage money. Through WealthGenie, we aim to increase financial awareness by giving users insights into the potential returns they can make by investing their money into different asset classes. In addition, users can dabble in risk-free investing by creating sample portfolios from historical data.


## Installing WealthGenie

1. Ensure that you have the latest version of `Node` and `npm` installed.
2. Download and unzip `CIS-550-Project.zip` from the canvas submission. 
3. In terminal, `cd` into the `CIS-550-Project/client` folder and run `npm install`.  
4. Use `cd` again to navigate to the `CIS-550-Project/server` folder and run `npm install`.

## Running WealthGenie
1. In terminal, `cd` into the `CIS-550-Project/client` folder and run `npm start`. Your default browser should automatically open to `localhost:3000/stock`.
2. In a new window of terminal, `cd` into the `CIS-550-Project/server` folder and run `npm start`. If you do not get any errors, you are done! 
    1.  However, if you get an error saying `DPI-1047: Cannot locate a 64-bit Oracle Client library` followed by a lot more errors, then keep on following the next steps. 
    2. Download the Oracle Instant Client zip file from: http://www.oracle.com/technetwork/topics/intel-macsoft-096467.html
    3. Place all the contents of the unzipped folder (note: the contents and not the folder) inside the directory `/usr/local/lib`. In other words, `lib` will be a folder to where you will copy paste all the contents of the unzipped folder.
    4. Run `npm start` again from within the `CIS-550-Project/server` folder.
    5. After this, you might run into malware issues where mac will disallow usage of certain files. You need to go to System Preferences > Security Settings (or something like that) and allow access.
    6. You are done!
## Other notes
The pre-processing code can be found in the `CIS-550-Project/cis550ProjectDataWrangling.sql` file. 
