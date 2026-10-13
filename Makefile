CXX = g++
CXXFLAGS = -std=c++17 -O2 -Wall -Wextra

analyzer: main.cpp Graph.cpp Graph.h
	$(CXX) $(CXXFLAGS) main.cpp Graph.cpp -o analyzer

demo: analyzer
	./analyzer transactions.txt --demo

clean:
	rm -f analyzer
