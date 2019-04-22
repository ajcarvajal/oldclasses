disp("*******************")
disp("****Question 46****")
disp("*******************")

clear
equalCount = 0;
for(i = 1:4)
    printf("Creating a 4x4 random matrix A and B. \n")

    A = rand(4);
    B = rand(4);
    x = det(A*B);
    y = det(A) * det(B);

    %round to 5 decimal places for comparison
    temp = mat2str(x,5);
    x = eval(temp);
    temp = mat2str(y,5);
    y = eval(temp);

    printf("det(AB) = %d \n", x)
    printf("det(A) * det(B) = %d \n", y)
    if(x == y)
        printf("%d == %d \n \n", x, y)
        equalCount++;
    endif
    if(equalCount == 4)
        printf("All statements were equivalent. Property det(AB) == det(A)det(B) holds true. \n \n")
        endif
endfor