/* eslint-disable @typescript-eslint/no-require-imports */

import { LoggerUtil } from './logger.util';

describe('logger utility test', () => {
  describe('logger instance', () => {
    jest.mock('../configs/logger.config', () => ({
      LEVEL: 'debug',
      TRANSPORT: 'console',
    }));

    let logger: LoggerUtil;

    beforeEach(() => {
      logger = new LoggerUtil('TestClass');
    });

    it('should log debug with string', () => {
      const spy = jest
        .spyOn<any, any>(LoggerUtil['logger'], 'debug')
        .mockImplementation(() => true);

      logger.debug('debug message');

      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining('debug message'),
        expect.objectContaining({ classname: 'TestClass' }),
      );

      spy.mockRestore();
    });

    it('should log debug with object', () => {
      const spy = jest
        .spyOn<any, any>(LoggerUtil['logger'], 'debug')
        .mockImplementation(() => true);

      logger.debug('user data', { email: 'ucup@gmail.com' });

      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining('"email": "ucup@gmail.com"'),
        expect.objectContaining({ classname: 'TestClass' }),
      );

      spy.mockRestore();
    });

    it('should log info', () => {
      const spy = jest
        .spyOn<any, any>(LoggerUtil['logger'], 'info')
        .mockImplementation(() => true);

      logger.info('info message');

      expect(spy).toHaveBeenCalledWith(
        'info message',
        expect.objectContaining({ classname: 'TestClass' }),
      );

      spy.mockRestore();
    });

    it('should log http', () => {
      const spy = jest
        .spyOn<any, any>(LoggerUtil['logger'], 'http')
        .mockImplementation(() => true);

      logger.http('http message');

      expect(spy).toHaveBeenCalledWith(
        'http message',
        expect.objectContaining({ classname: 'TestClass' }),
      );

      spy.mockRestore();
    });

    it('should log error with string', () => {
      const spy = jest
        .spyOn<any, any>(LoggerUtil['logger'], 'error')
        .mockImplementation(() => true);

      logger.error('something wrong');

      expect(spy).toHaveBeenCalledWith(
        'something wrong',
        expect.objectContaining({ classname: 'TestClass' }),
      );

      spy.mockRestore();
    });

    it('should log error with Error object', () => {
      const spy = jest
        .spyOn<any, any>(LoggerUtil['logger'], 'error')
        .mockImplementation(() => true);

      const err = new Error('an unexpected error occur!');
      logger.error(err);

      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining('an unexpected error occur!'),
        expect.objectContaining({ classname: 'TestClass' }),
      );

      spy.mockRestore();
    });

    it('should return global instance from getGlobalInstance', () => {
      const globalLogger = LoggerUtil.getGlobalInstance();
      expect(globalLogger).toBeInstanceOf(LoggerUtil);
    });

    it('should return pretty JSON string', () => {
      const json = (logger as any).toJson({ id: 1, name: 'ucup' });

      expect(json).toContain('"id": 1');
      expect(json).toContain('"name": "ucup"');
      expect(json).toMatch(/\{\n\s+"id": 1,\n\s+"name": "ucup"\n\}/);
    });
  });

  describe('logger static block', () => {
    jest.mock('winston', () => {
      return {
        createLogger: jest.fn().mockReturnValue({}),
        format: {
          printf: jest.fn((fn) => fn),
        },
        transports: {
          Console: jest.fn().mockImplementation(() => ({ type: 'console' })),
        },
      };
    });

    jest.mock('winston-daily-rotate-file', () => {
      return jest.fn().mockImplementation(() => ({ type: 'dailyRotate' }));
    });

    let createLoggerMock: jest.Mock;
    let ConsoleMock: jest.Mock;
    let DailyRotateFileMock: jest.Mock;

    beforeEach(() => {
      jest.resetModules();
      createLoggerMock = require('winston').createLogger;
      ConsoleMock = require('winston').transports.Console;
      DailyRotateFileMock = require('winston-daily-rotate-file');
    });

    it('should configure only Console when TRANSPORT=console', () => {
      jest.doMock('../configs/logger.config', () => ({
        LEVEL: 'debug',
        TRANSPORT: 'console',
      }));

      require('./logger.util');

      expect(ConsoleMock).toHaveBeenCalledTimes(1);
      expect(DailyRotateFileMock).not.toHaveBeenCalled();
      expect(createLoggerMock).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'debug',
          transports: [expect.objectContaining({ type: 'console' })],
        }),
      );
    });

    it('should configure only DailyRotateFile when TRANSPORT=file', () => {
      jest.doMock('../configs/logger.config', () => ({
        LEVEL: 'info',
        TRANSPORT: 'file',
      }));

      require('./logger.util');

      expect(ConsoleMock).not.toHaveBeenCalled();
      expect(DailyRotateFileMock).toHaveBeenCalledTimes(1);
      expect(createLoggerMock).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info',
          transports: [expect.objectContaining({ type: 'dailyRotate' })],
        }),
      );
    });

    it('should configure both Console and DailyRotateFile when TRANSPORT=both', () => {
      jest.doMock('../configs/logger.config', () => ({
        LEVEL: 'warn',
        TRANSPORT: 'both',
      }));

      require('./logger.util');

      expect(ConsoleMock).toHaveBeenCalledTimes(1);
      expect(DailyRotateFileMock).toHaveBeenCalledTimes(1);
      expect(createLoggerMock).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'warn',
          transports: [
            expect.objectContaining({ type: 'console' }),
            expect.objectContaining({ type: 'dailyRotate' }),
          ],
        }),
      );
    });
  });
});
