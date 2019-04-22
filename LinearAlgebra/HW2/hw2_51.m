disp("*******************")
disp("****Question 51****")
disp("*******************")

clear
v = [8 -4 -7; -4 3 6; -3 -2 -5; 9 -8 -18];
w = [9; -4; -4; 7];
printf("row reduced form of augmented matrix v1,v2,v3,w")
x = rref([v,w])

printf("W is in the subspace of v1,v2,v3 because we can express it using \n")
x(:,end)