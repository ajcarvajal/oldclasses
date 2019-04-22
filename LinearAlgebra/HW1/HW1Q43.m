disp("___Question 43___")

for(i = 1:4)
disp("Creating two 4x4 random matrices A, B")
A = rand(4,4);
B = rand(4,4);

%round matrices to 5 decimal places to avoid rounding errors
temp = mat2str(A,5);
A = eval(temp);
temp = mat2str(B,5);
B = eval(temp);

C = A*B;
D = B*A;

disp("does A*B == B*A ?")
if(C == D)
  disp("True!\n")
else disp("False!\n")
endif

endfor

disp("conclusion: matrix multiplication is not communitive\n")