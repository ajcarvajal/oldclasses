disp("*******************")
disp("****Question 52****")
disp("*******************")
clear
A = [3 -5 -9; 8 7 -6; -5 -8 3; 2 -2 -9];
y = [-4; -8; 6; -5];
printf("row reduced form of augmented matrix A,y \n")
x = rref([A,y])

printf("y is in the subspace of col A because we can express it using \n")
x(:,end)