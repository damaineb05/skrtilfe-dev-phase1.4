import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Video, 
  Plus,
  Search,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const events = [
  {
    id: 1,
    title: 'Genesis Collection Drop Party',
    description: 'Join us for the exclusive reveal of our Genesis NFT collection with live minting and giveaways.',
    date: '2024-12-15',
    time: '8:00 PM EST',
    type: 'Virtual',
    platform: 'Discord',
    attendees: 234,
    maxAttendees: 500,
    host: { name: 'SKRTLIFE', avatar: '⚡' },
    cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
    category: 'Drop',
    isAttending: true,
    isFeatured: true
  },
  {
    id: 2,
    title: 'Creator Meetup NYC',
    description: 'Network with fellow creators and collectors at our NYC meetup. Food and drinks provided!',
    date: '2024-12-20',
    time: '7:00 PM EST',
    type: 'In-Person',
    location: 'SoHo House, NYC',
    attendees: 89,
    maxAttendees: 100,
    host: { name: 'NYC Collective', avatar: '🗽' },
    cover: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    category: 'Meetup',
    isAttending: false
  },
  {
    id: 3,
    title: 'DripSync Workshop: Advanced Avatar Customization',
    description: 'Learn advanced techniques for creating stunning avatars in our hands-on workshop.',
    date: '2024-12-18',
    time: '3:00 PM EST',
    type: 'Virtual',
    platform: 'Zoom',
    attendees: 156,
    maxAttendees: 200,
    host: { name: 'Avatar Academy', avatar: '🎨' },
    cover: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    category: 'Workshop',
    isAttending: true
  },
  {
    id: 4,
    title: 'Web3 Fashion Week Panel',
    description: 'Industry leaders discuss the future of digital fashion and wearable NFTs.',
    date: '2024-12-22',
    time: '2:00 PM EST',
    type: 'Virtual',
    platform: 'Twitter Spaces',
    attendees: 412,
    maxAttendees: null,
    host: { name: 'Fashion DAO', avatar: '👗' },
    cover: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    category: 'Panel',
    isAttending: false,
    isFeatured: true
  },
  {
    id: 5,
    title: 'NFT Trading Masterclass',
    description: 'Expert traders share their strategies for navigating the NFT market.',
    date: '2024-12-25',
    time: '6:00 PM EST',
    type: 'Virtual',
    platform: 'Discord',
    attendees: 278,
    maxAttendees: 300,
    host: { name: 'Trader Guild', avatar: '💎' },
    cover: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
    category: 'Workshop',
    isAttending: false
  }
];

const categories = ['All', 'Drop', 'Meetup', 'Workshop', 'Panel', 'Party'];
const types = ['All', 'Virtual', 'In-Person'];

export default function CommunityEvents({ onSelectEvent }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [showMyEvents, setShowMyEvents] = useState(false);

  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchQuery || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const matchesType = selectedType === 'All' || event.type === selectedType;
    const matchesMyEvents = !showMyEvents || event.isAttending;
    return matchesSearch && matchesCategory && matchesType && matchesMyEvents;
  });

  const featuredEvents = filteredEvents.filter(e => e.isFeatured);
  const upcomingEvents = filteredEvents.filter(e => !e.isFeatured);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-400" />
            Events
          </h2>
          <p className="text-gray-400 text-sm mt-1">Discover and join community events</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold">
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-900 border-zinc-800 text-white"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowMyEvents(!showMyEvents)}
              className={`${showMyEvents ? 'bg-purple-500 text-white' : 'bg-zinc-800 text-gray-400'}`}
            >
              <Star className="w-4 h-4 mr-2" />
              My Events
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-purple-500 text-white'
                  : 'bg-zinc-800 text-gray-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
          <div className="w-px bg-zinc-700 mx-2" />
          {types.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedType === type
                  ? 'bg-cyan-500 text-black'
                  : 'bg-zinc-800 text-gray-400 hover:text-white'
              }`}
            >
              {type === 'Virtual' && <Video className="w-3 h-3 inline mr-1" />}
              {type === 'In-Person' && <MapPin className="w-3 h-3 inline mr-1" />}
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            Featured
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {featuredEvents.map((event, index) => (
              <FeaturedEventCard 
                key={event.id} 
                event={event} 
                index={index}
                formatDate={formatDate}
                onSelect={() => onSelectEvent?.(event)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-white mb-4">Upcoming</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingEvents.map((event, index) => (
              <EventCard 
                key={event.id} 
                event={event} 
                index={index}
                formatDate={formatDate}
                onSelect={() => onSelectEvent?.(event)}
              />
            ))}
          </div>
        </div>
      )}

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No events found matching your criteria</p>
        </div>
      )}
    </div>
  );
}

function FeaturedEventCard({ event, index, formatDate, onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onSelect}
      className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all cursor-pointer group"
    >
      <div className="flex flex-col md:flex-row">
        {/* Cover Image */}
        <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden">
          <img 
            src={event.cover} 
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-900/80 hidden md:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent md:hidden" />
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`text-[10px] ${event.type === 'Virtual' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-purple-500/20 text-purple-400'}`}>
                  {event.type === 'Virtual' ? <Video className="w-3 h-3 mr-1" /> : <MapPin className="w-3 h-3 mr-1" />}
                  {event.type}
                </Badge>
                <Badge className="bg-zinc-800 text-gray-400 text-[10px]">{event.category}</Badge>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                {event.title}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-white">{new Date(event.date).getDate()}</p>
              <p className="text-xs text-gray-400 uppercase">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</p>
            </div>
          </div>

          <p className="text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {event.time}
            </span>
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {event.location}
              </span>
            )}
            {event.platform && (
              <span className="flex items-center gap-1">
                <Video className="w-4 h-4" />
                {event.platform}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-lg">
                {event.host.avatar}
              </div>
              <span className="text-sm text-gray-400">Hosted by <span className="text-white font-medium">{event.host.name}</span></span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-white">{event.attendees}</p>
                <p className="text-[10px] text-gray-500">{event.maxAttendees ? `of ${event.maxAttendees}` : 'attending'}</p>
              </div>
              {event.isAttending ? (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  Going
                </Badge>
              ) : (
                <Button className="bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-full">
                  RSVP
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EventCard({ event, index, formatDate, onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onSelect}
      className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all cursor-pointer group"
    >
      {/* Cover */}
      <div className="h-32 relative overflow-hidden">
        <img 
          src={event.cover} 
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
        <Badge className={`absolute top-3 left-3 text-[10px] ${event.type === 'Virtual' ? 'bg-cyan-500/90' : 'bg-purple-500/90'} text-white`}>
          {event.type}
        </Badge>
        <div className="absolute bottom-3 left-3 bg-zinc-900/90 backdrop-blur-sm rounded-lg px-3 py-1">
          <p className="text-xs text-gray-400">{formatDate(event.date)}</p>
          <p className="text-sm font-bold text-white">{event.time}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 className="font-bold text-white mb-2 group-hover:text-purple-400 transition-colors line-clamp-1">
          {event.title}
        </h4>
        <p className="text-sm text-gray-400 line-clamp-2 mb-3">{event.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-sm">
              {event.host.avatar}
            </div>
            <span className="text-xs text-gray-500">{event.host.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-400">{event.attendees}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}