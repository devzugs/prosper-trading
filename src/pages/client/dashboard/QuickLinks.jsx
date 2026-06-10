import React from "react";
import { Link } from "react-router-dom";
import { APP_SIDEBAR_NAV } from "../../../config/navigation";

const QuickLinks = () => {
    const firstFourLinks = APP_SIDEBAR_NAV
        .flatMap(navSection => navSection.items)
        .slice(1, 5);

    return (
        <div className="p-6 pt-0 lg:hidden">
            <h3 className="text-lg font-bold text-heading mb-4">Quick Links</h3>
            
            <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {firstFourLinks.map((item, index) => {
                    const Icon = item.icon; 
                    return (
                        <li key={index}>
                            <Link 
                                to={item.to}
                                className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border  p-4 hover:border-accent/40 hover:shadow-lg my-transition group"
                            >
                                <span className="bg-accent/20 p-3 rounded-md group-hover:bg-accent/30 my-transition">
                                    {Icon && <Icon size={20} className="text-accent" />}
                                </span>
                                
                                <span className="text-sm font-medium text-text-light group-hover:text-white my-transition">
                                    {item.label}
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default QuickLinks;