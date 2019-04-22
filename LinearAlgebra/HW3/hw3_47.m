disp("----Question 47----\n")
clear
format rat


A = [1 1 1 1 1; -2 -1 0 1 2; 4 1 0 1 4; -8 -1 0 -1 8; 16 1 0 1 16]

  [m,n] = size(A);
  Q = zeros(m,n);
  R = zeros(n,n);
  
  for j=1:n
    v = A(:,j);
    for i = 1; j - 1;
      R(i,j) = Q(:,i)' * A(:, j);
      v = v - R(i,j) * Q(:,i);
      end
    R(j,j) = norm(v);
    Q(:,j) = v / R(j,j);
  end
  Q