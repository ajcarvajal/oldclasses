disp("*******************")
disp("****Question 53****")
disp("*******************")
clear
A = [-8 5 -2 0; -5 2 1 -2; 10 -8 6 -3; 3 -2 1 0];
w = [1; 2; 1; 0];
printf("finding solutions for Ax = 0 \n")
[A,zeros(4,1)]
x = rref([A,zeros(4,1)])
null(A)