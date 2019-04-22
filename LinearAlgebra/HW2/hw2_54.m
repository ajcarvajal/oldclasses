disp("*******************")
disp("****Question 54****")
disp("*******************")
clear
A = [-3 3 0 6 -6; 2 0 2 -2 3; 6 -9 -4 -14 0; 0 0 0 0 -1; -7 6 -1 13 0]

printf("Reducing A to find pivot points\n")

rref(A)

printf("Row 4 doesn't have a pivot point, so the basis is A without row 4\n")

A(:,4) = []
