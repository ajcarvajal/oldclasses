disp("*******************")
disp("****Question 56****")
disp("*******************")

clear
for t = 1:7
A(t,:) = [1 cos(t) (cos(t))^2 (cos(t))^3 (cos(t))^4 (cos(t))^5 (cos(t))^6]
end

%rref(A)

printf("A is linearly independent because it reduces to n pivot points \n")