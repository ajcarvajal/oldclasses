disp("*******************")
disp("****Question 57****")
disp("*******************")
clear
B = [-6 8 -9; 4 -3 5; -9 7 -8; 4 -3 3]
x = [4; 7; -8; 3]

printf("Is B a basis for span v1,v2,v3?\n")
rref(B)
printf("system is linearly independent, so yes\n")

printf("B-coordinate vector of x: \n")
rref([B,x])
printf("row reduce\n")
ans(:,end)