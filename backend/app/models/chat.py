from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.user import User


class ChatChannel(Base):
    __tablename__ = "chat_channels"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    channel_type: Mapped[str] = mapped_column(String(50), default="team", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    messages: Mapped[list["ChatMessage"]] = relationship(
        "ChatMessage",
        back_populates="channel",
        cascade="all, delete-orphan",
        order_by="ChatMessage.created_at",
    )
    dm_participants: Mapped[list["DmParticipant"]] = relationship(
        "DmParticipant",
        back_populates="channel",
        cascade="all, delete-orphan",
    )


class DmParticipant(Base):
    __tablename__ = "dm_participants"
    __table_args__ = (UniqueConstraint("channel_id", "user_id", name="uq_dm_channel_user"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    channel_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("chat_channels.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    channel: Mapped["ChatChannel"] = relationship("ChatChannel", back_populates="dm_participants")
    user: Mapped["User"] = relationship("User")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    channel_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("chat_channels.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    sender_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    message_type: Mapped[str] = mapped_column(String(50), default="text", nullable=False)
    attachment_file_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    attachment_stored_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    attachment_mime_type: Mapped[Optional[str]] = mapped_column(String(127), nullable=True)
    attachment_size: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    parent_message_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("chat_messages.id", ondelete="CASCADE"),
        index=True,
        nullable=True,
    )
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    channel: Mapped["ChatChannel"] = relationship("ChatChannel", back_populates="messages")
    sender: Mapped["User"] = relationship("User")
    parent_message: Mapped[Optional["ChatMessage"]] = relationship(
        "ChatMessage",
        remote_side="ChatMessage.id",
        back_populates="replies",
    )
    replies: Mapped[list["ChatMessage"]] = relationship(
        "ChatMessage",
        back_populates="parent_message",
        cascade="all, delete-orphan",
    )
    reactions: Mapped[list["MessageReaction"]] = relationship(
        "MessageReaction",
        back_populates="message",
        cascade="all, delete-orphan",
    )


class MessageReaction(Base):
    __tablename__ = "message_reactions"
    __table_args__ = (
        UniqueConstraint("message_id", "user_id", "emoji", name="uq_message_user_emoji"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    message_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("chat_messages.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    emoji: Mapped[str] = mapped_column(String(32), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    message: Mapped["ChatMessage"] = relationship("ChatMessage", back_populates="reactions")
    user: Mapped["User"] = relationship("User")
