disp("*******************")
disp("****Question 55****")
disp("*******************")
clear
H = [1 0 3; 2 2 4; 0 -1 1; -1 1 -4]
K = [-2 2 -1; -2 3 4; -1 2 6; 3 -6 -2]

spanH = rref(H)
spanH(:,3) = []

spanK= rref(K)
spanK = K

spanHK = rref(H+K)
spanHK = H+K