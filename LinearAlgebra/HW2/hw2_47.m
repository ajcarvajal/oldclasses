disp("*******************")
disp("****Question 47****")
disp("*******************")
clear
for(i = 4:6)
    printf("Creating a random %dx%d matrix \n", i,i)

    A = rand(i);
    x = det(A);
    y = det(pinv(A));

    %round to 5 decimal places for comparison
    temp = mat2str(x,5);
    x = eval(temp);
    temp = mat2str(y,5);
    y = eval(temp);

    printf("det(A) = %d \n", x)
    printf("det(A^-1) = %d \n", y)
    printf("1 / det(A) = %d \n\n", 1/x)

    if(x == 0)
        rref(A)
        endif
endfor

printf("det(A^-1) == 1 / det(A) \n\n")