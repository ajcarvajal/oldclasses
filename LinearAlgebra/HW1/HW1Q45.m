disp("___Question 45___")

for(i = 1:3)
disp("Creating a random 4x4 matrices A and B, and comparing operations.")
A = rand(4,4);
B = rand(4,4);

B = (A+B)*(A-B);
C = A^2 - B^2;

%round results to 5 decimal places to avoid rounding errors
temp = mat2str(B,5);
B = eval(temp)
temp = mat2str(C,5);
C = eval(temp)

disp("does (A+B)(A-B) == A^2 - B^2 ?")
if(B == C)
  disp("True!\n")
else disp("False!\n")
endif

endfor

disp("matrix multiplication isn't communitive")