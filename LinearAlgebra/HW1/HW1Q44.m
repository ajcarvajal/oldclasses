disp("___Question 44___")

for(i = 1:3)
disp("Creating a random 5x5 matrix A, and comparing operations.")
A = rand(5,5);

B = (A+eye(5))*(A-eye(5));
C = A^2 - eye(5);

%round results to 5 decimal places to avoid rounding errors
temp = mat2str(B,5);
B = eval(temp);
temp = mat2str(C,5);
C = eval(temp);

disp("does (A+I)(A-I) == A^2 - I ?")
if(B == C)
  disp("True!\n")
else disp("False!\n")
endif

endfor
