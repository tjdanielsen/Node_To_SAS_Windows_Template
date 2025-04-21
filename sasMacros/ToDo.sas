%MACRO ToDo;

    %IF &ToDo EQ sasJ %THEN %DO;
        DATA temp;
            x=&secondP;y=20;z=30;OUTPUT;
            x=1;y=2;z=3;OUTPUT;
            x=100;y=&secondP;z=300;OUTPUT;
            x=101;y=201;z=301;OUTPUT;
            x=11;y=22;z=&secondP;OUTPUT;
        RUN;
        PROC JSON OUT="&outfile";
            EXPORT temp / NOSASTAGS;
        RUN;
    %END;

    %ELSE %IF &ToDo EQ sasT %THEN %DO;
        DATA _NULL_;
            FILE "&outfile";
            PUT "Hello World!  This is SAS calling.";
        RUN;
    %END;

%MEND;