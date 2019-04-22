disp("*******************")
disp("****Question 50****")
disp("*******************")
clear
%Test Cramer’s rule for a random 4 × 4 matrix A and a random 4 × 1 vector b. Compute each entry in
%the soution of Ax = b, and compare these entries with the entries of A−1b. Write the commands for
%your program that uses Cramer’s rule to prduce the second entry of x.

A = rand(4)
b = rand(4,1)
x = zeros(4,1);

printf("Computing Ax = b using Cramer's rule \n\n")

for(i = 1:4)
    temp = A;
    printf("Replacing row %d with vector b \n", i)
    temp(:,i) = b
    printf("Adding determinate to our answer vector \n")
    x(i,1) = det(temp)
endfor

printf("Solution for Ax = b using Cramer's rule: \n")
x * (1/det(A))

printf("Solution for Ax = b using A^-1 * b = \n")
pinv(A) * b
