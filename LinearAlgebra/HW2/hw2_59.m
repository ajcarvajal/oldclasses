disp("*******************")
disp("****Question 59****")
disp("*******************")
clear
A = [7 -9 -4 5 3 -3 -7; -4 6 7 -2 -6 -5 5; 5 -7 -6 5 -6 2 8; -3 5 8 -1 -7 -4 8; 6 -8 -5 4 4 9 3]

printf("Part A. \n")
rref(A)
C = A;
C(:,3) = [];
C(:,4) = [];
C(:,5) = [];
C

N = null(sym(A))

printf("Part B. \n")
printf("Bottom row of reduced matrix A is zero, so row(A) is all except the last row\n")
R = A;
R(end,:) = []

printf("Part C. \n")

M = null(sym(A'))

printf("Part D. \n")
S = [R', N]
T = [C, M]

printf("Part E. \n")
printf("S and T are square because R' = C, and C + N = columns\n")

printf("Part F. \n")
detS = det(S)
detT = det(T)
printf("S and T are invertible because their determinate is non-zero\n")