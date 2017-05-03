var arr3=['a',2,1,3,1,4,'a'];
unique = [];

         function findUnique(val)
        {
         status = '0';
         unique.forEach(function(itm){

            if(itm==val)
            { 
            status=1;
            }

                    })
       return status;
       }

       arr3.forEach(function(itm){

        rtn =  findUnique(itm);
        if(rtn==0)
        unique.push(itm);


        });
       console.log(unique);