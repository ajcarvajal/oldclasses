disp("*******************")
disp("****Question 58****")
disp("*******************")

clear
for t = 1:7
B(t,:) = [1 cos(t) (cos(t))^2 (cos(t))^3 (cos(t))^4 (cos(t))^5 (cos(t))^6]
C(t,:) = [1 cos(t) cos(2*t) cos(3*t) cos(4*t) cos(5*t) cos(6*t)]

end

rref(B)
rref(C)

printf("C is a basis of H because it is linearly independent and spans the set\n")