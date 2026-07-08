import { useAuth } from "../../context/AuthContext";

export const DEFAULT_USER_NAME = "Investor";
export const DEFAULT_USER_INITIALS = "U";

export const getUserFullName = ({
  name,
  profile,
  user,
  fallback = DEFAULT_USER_NAME,
} = {}) => {
  const fullName =
    name ||
    profile?.full_name ||
    profile?.name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email;

  return fullName?.trim?.() || fallback;
};

export const getUserInitials = (name, fallback = DEFAULT_USER_INITIALS) => {
  if (!name?.trim?.()) return fallback;

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return fallback;

  return parts
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const UserIdentity = ({
  variant = "name",
  name,
  avatarSrc,
  className = "",
  fallbackName = DEFAULT_USER_NAME,
  fallbackInitials = DEFAULT_USER_INITIALS,
  imageAlt = "User profile photo",
}) => {
  const { profile, user } = useAuth();
  const fullName = getUserFullName({
    name,
    profile,
    user,
    fallback: fallbackName,
  });
  const initials = getUserInitials(fullName, fallbackInitials);

  if (variant === "initials") return initials;

  if (variant === "avatar") {
    if (avatarSrc) {
      return (
        <img
          src={avatarSrc}
          alt={imageAlt}
          className={className}
        />
      );
    }

    return (
      <div className={className} aria-label={fullName}>
        {initials}
      </div>
    );
  }

  return fullName;
};

export default UserIdentity;
