#encoding: utf8
import numpy as np
import matplotlib.pyplot as plt

def t_from_P_n(P, n):
	term1 = -np.log(P/2)
	term2 = 2*n
	return np.sqrt(term1/term2)

def P_from_t_n(t, n):
	# P = 2 exp(-2nt2)
	return 2 * np.exp(-2*n*t*t)

def n_from_P_t(P, t):
	term1 = -np.log(P/2)
	term2 = 2*t*t
	return term1/term2

print(t_from_P_n(P=0.01, n=100000))
print(P_from_t_n(t=0.03, n=500))

# P vs n
plt.figure()
plt.gca().set_xscale('log')
n = np.logspace(2,5,100,base=10)
ts = [0.005, 0.01, 0.02, 0.05, 0.1]
Ps_ts = [(P_from_t_n(t, n), t) for t in ts]
for P,t in Ps_ts:
	plt.plot(n, P, label='t = ' +str(t))
plt.xlabel('n (log scale)')
plt.ylabel('P')
plt.title('P vs. n at constant t')
plt.legend()

# invert: n vs P
plt.figure()
plt.gca().set_yscale('log')
P = np.linspace(0.005,0.2,100)
ts = [0.005, 0.01, 0.02, 0.05, 0.1]
ns_ts = [(n_from_P_t(P, t), t) for t in ts]
for n,t in ns_ts:
	plt.plot(P, n, label='t = ' +str(t))
plt.xlabel('P')
plt.ylabel('n (log scale)')
plt.title('n vs. P at constant t')
plt.legend()

# t vs P
plt.figure()
P = np.linspace(0.005,0.2,100)
ns = [300, 1000, 3000, 10000, 30000]
ts_ns = [(t_from_P_n(P, n), n) for n in ns]
for t,n in ts_ns:
	plt.plot(P, t, label='n = ' +str(n))
plt.xlabel('P')
plt.ylabel('t')
plt.title('t vs. P at constant n')
plt.legend()

# invert: P vs t
plt.figure()
t = np.linspace(0.005,0.1,100)
ns = [300, 1000, 3000, 10000, 30000]
Ps_ns = [(P_from_t_n(t, n), n) for n in ns]
for P,n in Ps_ns:
	plt.plot(t, P, label='n = ' +str(n))
plt.xlabel('t')
plt.ylabel('P')
plt.title('P vs. t at constant n')
plt.legend()

# t vs n
plt.figure()
plt.gca().set_xscale('log')
n = np.logspace(2,5,100,base=10)
Ps = [0.01, 0.02, 0.05, 0.10, 0.20]
ts_Ps = [(t_from_P_n(P, n), P) for P in Ps]
for t,P in ts_Ps:
	plt.plot(n, t, label='P = ' +str(P))
plt.xlabel('n (log scale)')
plt.ylabel('t')
plt.title('t vs. n at constant P')
plt.legend()

# invert: n vs t
plt.figure()
plt.gca().set_yscale('log')
t = np.linspace(0.005,0.1,100)
Ps = [0.01, 0.02, 0.05, 0.10, 0.20]
ns_Ps = [(n_from_P_t(P, t), P) for P in Ps]
for n,P in ns_Ps:
	plt.plot(t, n, label='P = ' +str(P))
plt.xlabel('t')
plt.ylabel('n (log scale)')
plt.title('n vs. t at constant P')
plt.legend()

plt.show()