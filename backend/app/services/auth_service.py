from sqlalchemy.orm import Session

from app.models.user import User

from app.schemas.auth import (
    RegisterRequest,
    LoginRequest
)

from app.core.security import (
    hash_password,
    verify_password
)

from app.core.jwt_handler import (
    create_access_token
)


class AuthService:

    @staticmethod
    def register_user(
        db: Session,
        data: RegisterRequest
    ):

        # Check Email

        existing_user = db.query(User).filter(
            User.email == data.email
        ).first()

        if existing_user:
            raise ValueError(
                "Email already registered"
            )

        # Check Register Number

        existing_register_no = db.query(User).filter(
            User.register_no == data.register_no
        ).first()

        if existing_register_no:
            raise ValueError(
                "Register Number already exists"
            )

        # Hash Password

        hashed_password = hash_password(
            data.password
        )

        # Create Student Account

        new_user = User(
            register_no=data.register_no,
            name=data.name,
            email=data.email,
            phone=data.phone,
            password_hash=hashed_password,
            department_id=data.department_id,
            role="STUDENT",
            is_active=True
        )

        db.add(new_user)

        db.commit()

        db.refresh(new_user)

        return new_user

    @staticmethod
    def login_user(
        db: Session,
        data: LoginRequest
    ):

        # Find User

        user = db.query(User).filter(
            User.email == data.email
        ).first()

        if not user:
            raise ValueError(
                "Invalid Email or Password"
            )

        # Check Account Status

        if not user.is_active:
            raise ValueError(
                "Account is disabled"
            )

        # Verify Password

        if not verify_password(
            data.password,
            user.password_hash
        ):
            raise ValueError(
                "Invalid Email or Password"
            )

        # Generate JWT

        access_token = create_access_token(
            {
                "user_id": user.user_id,
                "email": user.email,
                "role": user.role
            }
        )

        return {
            "access_token": access_token,
            "token_type": "bearer"
        }

    @staticmethod
    def get_user_by_email(
        db: Session,
        email: str
    ):

        return db.query(User).filter(
            User.email == email
        ).first()