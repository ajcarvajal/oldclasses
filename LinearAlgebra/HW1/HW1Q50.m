disp("\nQuestion 50a.")
  A = [4.5 3.1; 6 1.1];
  B = [19.2491; 6.843];
  ansA = A \ B

disp("\nQuestion 50b.")
  C = [4.5 3.1; 6 1.1];
  D = [19.251; 6.84];
  ansB = C \ D

disp("\nQuestion 50c.")
  pError = (ansA \ (ansA - ansB)) * 100

disp("\nQuestion 50b. ")
  condNumA = cond(A) %condition number for part a
  condNumB = cond(C) %condition number for part b