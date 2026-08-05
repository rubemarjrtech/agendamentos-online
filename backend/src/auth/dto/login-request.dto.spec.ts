import { validate } from 'class-validator';
import { LoginRequestDto } from './login-request.dto';

describe('LoginRequestDto', () => {
  let dto: LoginRequestDto;

  beforeEach(() => {
    dto = new LoginRequestDto();
  });

  it('should pass validation with valid email and password', async () => {
    // Arrange
    dto.email = 'test@test.com';
    dto.password = 'StrongPass123!';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(0);
  });

  it('should fail validation when email is missing', async () => {
    // Arrange
    dto.email = '';
    dto.password = 'StrongPass123!';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('should fail validation when email format is invalid', async () => {
    // Arrange
    dto.email = 'invalid-email';
    dto.password = 'StrongPass123!';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('should fail validation when email is not a string', async () => {
    // Arrange
    // @ts-expect-error - testing invalid type
    dto.email = 123;
    dto.password = 'StrongPass123!';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('should fail validation when password is missing', async () => {
    // Arrange
    dto.email = 'test@test.com';
    // @ts-expect-error - testing missing password
    dto.password = undefined;

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('should fail validation when password is not a string', async () => {
    // Arrange
    dto.email = 'test@test.com';
    // @ts-expect-error - testing invalid type
    dto.password = 123;

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });
});
