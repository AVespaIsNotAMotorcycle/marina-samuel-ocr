import numpy as np
import math

class NeuralNetwork:
    def _rand_initialize_weights(self, size_in, size_out):
        return [((x * 0.12) - 0.06) for x in np.random.rand(size_out, size_in)]
    
    def _sigmoid_scalar(self, z):
        return 1 / (1 + math.e ** -z)
    
    def __init__(self, num_hidden_nodes):
        print("Initializing neural network")
        self.theta1 = self._rand_initialize_weights(400, num_hidden_nodes)
        self.theta2 = self._rand_initialize_weights(num_hidden_nodes, 10)
        self.input_layer_bias = self._rand_initialize_weights(1, num_hidden_nodes)
        self.hidden_layer_bias = self._rand_initialize_weights(1, 10)
    
    def sigmoid(self, matrix):
        sigmoid_to_matrix = np.vectorize(self._sigmoid_scalar)
        new_matrix = sigmoid_to_matrix(matrix)
        return new_matrix

    def forward_propogate(self, pixels):
        y1 = np.dot(np.asmatrix(self.theta1), np.asmatrix(pixels).T)
        y1 = y1 + np.asmatrix(self.input_layer_bias)
        y1 = self.sigmoid(y1)
    
        y2 = np.dot(np.array(self.theta2), y1)
        y2 = y2 + np.asmatrix(self.hidden_layer_bias)
        y2 = self.sigmoid(y2)

        results = y2.T.tolist()[0]
        return results
    
    def back_propogate(self):
        actual_vals = [0] * 10
        actual_vals[data['label']] = 1
        output_errors = np.asmatrix(actual_vals).T - np.asmatrix(y2)
        hidden_errors = np.multiply(np.dot(np.asmatrix(self.theta2).T, output_errors), self.sigmoid_prime(sum1))
    
        self.theta1 += self.LEARNING_RATE * np.dot(np.asmatrix(hidden_errors), np.asmatrix(data['y0']))
        self.theta2 += self.LEARNING_RATE * np.dot(np.asmatrix(output_errors), np.asmatrix(y1).T)
        self.hidden_layer_bias += self.LEARNING_RATE * output_errors
        self.input_layer_bias += self.LEARNING_RATE * hidden_errors
    
    def predict(self, test):
        results = self.forward_propogate(test)

    
        # results = y2.T.tolist()[0]
        highest_confidence = max(results)
        confidence_percent = int(highest_confidence * 100)
        prediction = results.index(highest_confidence)
        print("Predicting digit is {0} with {1}% confidence".format(prediction, confidence_percent))
        return results.index(max(results))

    def train_on_example(self, pixels, digit):
        self.predict(pixels)
        print("Actual digit is {0}".format(digit))
        return

    def train(self, training_data):
        for example in training_data:
            self.train_on_example(example['y0'], example['label'])
        return
