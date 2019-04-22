disp("*******************")
disp("****Question 49****")
disp("*******************")
clear
A = rand(4)

adjA = det(A) * inv(A)

B = adjA / det(A)

printf("B - inv(A) = \n")
B - inv(A)