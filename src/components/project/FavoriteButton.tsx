import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/useFavorites';

interface FavoriteButtonProps {
  projectId: string;
  projectName: string;
  display?: 'icon' | 'button';
  className?: string;
}

const FavoriteButton = ({ projectId, projectName, display = 'icon', className }: FavoriteButtonProps) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorite = isFavorite(projectId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(projectId, projectName);
  };

  if (display === 'button') {
    return (
      <Button
        variant={favorite ? 'secondary' : 'outline'}
        onClick={handleClick}
        className={`w-full ${className ?? ''}`}
        title={favorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
        aria-pressed={favorite}
      >
        <Heart className={`w-4 h-4 mr-2 ${favorite ? 'fill-current text-destructive' : ''}`} />
        {favorite ? 'Bỏ yêu thích' : 'Yêu thích'}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className={`h-8 w-8 ${favorite ? 'text-destructive hover:text-destructive' : 'text-muted-foreground hover:text-foreground'}`}
      title={favorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
      aria-pressed={favorite}
    >
      <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
    </Button>
  );
};

export default FavoriteButton;
