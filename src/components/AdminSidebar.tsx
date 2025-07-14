import { BarChart3, Users, Shield } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

const items = [
  { title: "Štatistiky", url: "/admin", icon: BarChart3 },
  { title: "Účastníci", url: "/admin/participants", icon: Users },
  { title: "ReCaptcha", url: "/admin/recaptcha", icon: Shield },
];

export function AdminSidebar() {
  const { state, setOpen } = useSidebar();
  const collapsed = state === "collapsed";
  const isMobile = useIsMobile();

  // Handle menu item click - close sidebar on mobile
  const handleMenuItemClick = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  return (
    <Sidebar className={`${collapsed ? "w-14" : "w-60"} border-r border-primary/20 bg-card shadow-sm`} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-semibold">Admin Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      onClick={handleMenuItemClick}
                      className={({ isActive }) =>
                        isActive ? "bg-muted border-r-2 border-r-primary/50 font-medium" : "hover:bg-muted/50"
                      }
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}