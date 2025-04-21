/* Program is called by NodeJS.  It initializes a batch SAS session and calls the macro passed as ToDo in -sysparm */

OPTIONS MPRINT;

OPTIONS MAUTOSOURCE SASAUTOS=("C:\users\67tim\onedrive\nodeTemplateW\sasMacros",sasautos);

/* parse sysparm coming from SAS batch mode and convert to macro variables */
/* this code comes from SAS support: https://www.sas.com/content/dam/SAS/en_ca/User%20Group%20Presentations/TASS/BatchProcessingSysparm.pdf */
%put &sysparm;
data _null_;
length sysparm express param value $ 200;
sysparm = symget('sysparm');
do i=1 to 50 until(express = '');
express = left(scan(sysparm, i, ',')); /* name=value */
param = left(upcase(scan(express, 1, '='))); /* name */
value = left(scan(express, 2, '='));
valid = not verify(substr(param, 1, 1),'ABCDEFGHIJKLMNOPQRSTUVWXYZ_')
and not verify(trim(param),'ABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789')
and length(param) <=32 ; /* Ensure valid V8 macrovar name */
if valid then call symput(param, trim(left(value)));
end;
run;
%put _user_ ;

/* set output file for SAS macros -- eventually needs to be unique for each user */
/* Node reads this file and sends output back to the browser */
/* If browser retrieves "EMPTY", then SAS Macro did not replace the file and there may be an error. */
%LET outfile = c:\users\67tim\onedrive\nodeTemplateW\outfile.txt;
DATA _NULL_;
    FILE "&outfile";
    PUT "EMPTY";
RUN;

%ToDo;

ODS _ALL_ CLOSE;
