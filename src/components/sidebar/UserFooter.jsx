import UserIdentity from "../user/UserIdentity";

const UserFooter = () => {
    return (
        <div className="border-t border-white/5 px-4 py-4">
            <div className="flex items-center gap-3">
            <UserIdentity
                variant="avatar"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent"
            />
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                <UserIdentity />
                </p>
                <p className="truncate text-[11px] text-accent">Growth Plan</p>
            </div>
            
            </div>
      </div>
    )
}

export default UserFooter;
