disp("----Question 46----\n")
clear

A = [-10 13 7 -11; 2 1 -5 3; -6 3 13 -3; 16 -16 -2 5; 2 1 -5 -7];

  [m,n] = size(A);
  Q = zeros(m,n);
  R = zeros(n,n);
  
  for j=1:n
    v = A(:,j);
    for i = 1; j - 1
      R(i,j) = Q(:,i)' * A(:, j);
      v = v - R(i,j) * Q(:,i)
      end
    R(j,j) = norm(v);
    Q(:,j) = v / R(j,j);
  end
  
  
%part A: 
disp("orthogonal basis for A: ")
Q

disp("QR factorization: ")
Q
R

disp("Q*R = ")
Q*R
