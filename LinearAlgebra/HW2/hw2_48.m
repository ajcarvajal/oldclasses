disp("*******************")
disp("****Question 48****")
disp("*******************")
clear
count = 0;
i = 4;
while(i < 6)
    printf("Creating a random %dx%d matrix \n", i,i + 1)

    A = rand(i, i+1);
    x = det(A'*A);
    y = det(A*A');

    %round to 5 decimal places for comparison
    temp = mat2str(x,5);
    x = eval(temp);
    temp = mat2str(y,5);
    y = eval(temp);

    printf("det(A'A) = %d \n", x)
    printf("det(AA') = %d \n\n" , y)

    count++;
    if(count > 2)
        i++;
        count = 0;
    endif
end

printf("The property of det(A'*A) == det(A*A') doesn't apply when A isn't a square matrix \n\n")