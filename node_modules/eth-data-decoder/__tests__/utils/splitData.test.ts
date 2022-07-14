import { splitData } from '../../lib/utils/splitData';
import 'jasmine';

describe('splitData', () => {
    it('should split the data of function with 1 parameter', () => {
        // Arrange
        const functionSelector = 'a9059cbb';
        const param1 =
            '0000000000000000000000003f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be';
        const data = `0x${functionSelector}${param1}`;

        // Act
        const result = splitData(data);

        // Assert
        expect(result.functionSelector).toEqual(functionSelector);
        expect(result.params).toEqual([param1]);
    });

    it('should split the data of function no parameters', () => {
        // Arrange
        const functionSelector = 'a9059cbb';
        const data = `0x${functionSelector}`;

        // Act
        const result = splitData(data);

        // Assert
        expect(result.functionSelector).toEqual(functionSelector);
        expect(result.params).toEqual([]);
    });

    it('should split the data of function with multiple parameter', () => {
        // Arrange
        const functionSelector = 'a9059cbb';
        const param1 =
            '0000000000000000000000003f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be';
        const param2 =
            '0000000000000000000000003f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be';
        const data = `0x${functionSelector}${param1}${param2}`;

        // Act
        const result = splitData(data);

        // Assert
        expect(result.functionSelector).toEqual(functionSelector);
        expect(result.params).toEqual([param1, param2]);
    });

    it('should throw error if the data doesnt start with 0x', () => {
        // Act
        const func = () => splitData('0000');

        // Assert
        expect(func).toThrowError();
    });

    it('should throw error if the parameter is less than 32 bytes', () => {
        // Arrange
        const functionSelector = 'a9059cbb';
        const param1 =
            '0000000000000000000000003f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be';
        const param2 =
            '0000000000000000000000003f5ce5fbfe3e9af3971dd833d26ba9b5c936f0';
        const data = `0x${functionSelector}${param1}${param2}`;

        // Act
        const func = () => splitData(data);

        // Assert
        expect(func).toThrowError();
    });
});
