from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


async def create_user(db: AsyncSession, data: UserCreate, proof_path: str | None = None) -> User:
    user = User(
        role=data.role,
        email=data.email,
        password_hash=hash_password(data.password),
        contact_name=data.contact_name,
        phone=data.phone,
        institution_type=data.institution_type,
        organization_name=data.organization_name,
        # contributor
        address=data.address,
        city=data.city,
        additional_info=data.additional_info,
        proof_of_address=proof_path,
        # beneficiary
        address_city=data.address_city,
        dietary_restrictions=data.dietary_restrictions,
        refrigerator_storage=bool(data.refrigerator),
        freezer_storage=bool(data.freezer),
        dry_storage=bool(data.dry_storage),
        no_reliable_storage=bool(data.no_reliable_storage),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: str) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def authenticate_user(db: AsyncSession, email: str, password: str) -> User | None:
    user = await get_user_by_email(db, email)
    if user and verify_password(password, user.password_hash):
        return user
    return None


async def update_user(db: AsyncSession, user: User, data: UserUpdate) -> User:
    from app.core.security import hash_password
    updates = data.model_dump(exclude_none=True)
    if "password" in updates and updates["password"]:
        user.password_hash = hash_password(updates.pop("password"))
    else:
        updates.pop("password", None)
    for field, value in updates.items():
        setattr(user, field, value)
    await db.commit()
    await db.refresh(user)
    return user


async def delete_user(db: AsyncSession, user: User) -> None:
    await db.delete(user)
    await db.commit()
